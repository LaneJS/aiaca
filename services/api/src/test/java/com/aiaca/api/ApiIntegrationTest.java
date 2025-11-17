package com.aiaca.api;

import com.aiaca.api.dto.AuthDtos;
import com.aiaca.api.dto.ScanDtos;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import okhttp3.mockwebserver.Dispatcher;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    private static MockWebServer scannerServer;
    private static MockWebServer aiServer;

    private final AtomicBoolean failScanner = new AtomicBoolean(false);
    private final AtomicBoolean failAi = new AtomicBoolean(false);

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @BeforeAll
    static void startServers() throws IOException {
        scannerServer = new MockWebServer();
        aiServer = new MockWebServer();
        scannerServer.start();
        aiServer.start();
    }

    @AfterAll
    static void shutdownServers() throws IOException {
        scannerServer.shutdown();
        aiServer.shutdown();
    }

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("scanner.service-url", () -> scannerServer.url("/scan").toString());
        registry.add("ai-orchestrator.service-url", () -> aiServer.url("/suggest-fixes").toString());
        registry.add("ai-orchestrator.use-stub", () -> false);
        registry.add("security.jwt.secret", () -> "integration-secret-value-with-entropy-0123456789");
    }

    @BeforeEach
    void setUp() {
        failScanner.set(false);
        failAi.set(false);
        scannerServer.setDispatcher(new Dispatcher() {
            @Override
            public MockResponse dispatch(RecordedRequest recordedRequest) {
                if (failScanner.get()) {
                    return new MockResponse().setResponseCode(500).setBody("scanner down");
                }
                return new MockResponse()
                        .setResponseCode(200)
                        .addHeader("Content-Type", "application/json")
                        .setBody(scannerPayload());
            }
        });

        aiServer.setDispatcher(new Dispatcher() {
            @Override
            public MockResponse dispatch(RecordedRequest recordedRequest) {
                if (failAi.get()) {
                    return new MockResponse().setResponseCode(500).setBody("ai down");
                }
                return new MockResponse()
                        .setResponseCode(200)
                        .addHeader("Content-Type", "application/json")
                        .setBody(aiPayload());
            }
        });
    }

    @Test
    void endToEndAuthenticatedFlow() throws Exception {
        AuthDtos.RegisterRequest registerRequest = new AuthDtos.RegisterRequest("test@example.com", "Password123");
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(registerResult.getResponse().getContentAsString()).get("token").asText();

        Map<String, String> site = Map.of("name", "Demo Site", "url", "https://example.com");
        MvcResult siteResult = mockMvc.perform(post("/api/v1/sites")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(site)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode siteJson = objectMapper.readTree(siteResult.getResponse().getContentAsString());
        String siteId = siteJson.get("id").asText();

        mockMvc.perform(get("/api/v1/sites")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        ScanDtos.CreateScanRequest scanRequest = new ScanDtos.CreateScanRequest("https://example.com/page");
        MvcResult scanResult = mockMvc.perform(post("/api/v1/sites/" + siteId + "/scans")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode scanJson = objectMapper.readTree(scanResult.getResponse().getContentAsString());
        String scanId = scanJson.get("id").asText();
        assertThat(scanJson.get("issues").get(0).get("suggestion").asText()).isEqualTo("Add alt text");

        mockMvc.perform(get("/api/v1/sites/" + siteId + "/scans")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/scans/" + scanId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        String embedKey = siteJson.get("embedKey").asText();
        MvcResult embedResult = mockMvc.perform(get("/api/v1/sites/" + siteId + "/embed-config")
                        .header("X-Embed-Key", embedKey))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode embedJson = objectMapper.readTree(embedResult.getResponse().getContentAsString());
        assertThat(embedJson.get("siteId").asText()).isEqualTo(siteId);
    }

    @Test
    void unauthorizedRequestsAreRejected() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/sites"))
                .andReturn();
        assertThat(result.getResponse().getStatus()).isIn(401, 403);
    }

    @Test
    void logoutWithInvalidTokenIsNoOp() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer this.is.not.valid"))
                .andExpect(status().isNoContent());
    }

    @Test
    void rateLimitsPublicScans() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("url", "https://example.com"));
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/public/scans")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body)
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.1");
                                return request;
                            }))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/v1/public/scans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.1");
                            return request;
                        }))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void rejectsInvalidScanUrls() throws Exception {
        Map<String, String> site = Map.of("name", "Bad URL Site", "url", "https://example.com");
        AuthDtos.RegisterRequest registerRequest = new AuthDtos.RegisterRequest("urltest@example.com", "Password123");
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(registerResult.getResponse().getContentAsString()).get("token").asText();

        MvcResult siteResult = mockMvc.perform(post("/api/v1/sites")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(site)))
                .andExpect(status().isOk())
                .andReturn();
        String siteId = objectMapper.readTree(siteResult.getResponse().getContentAsString()).get("id").asText();

        ScanDtos.CreateScanRequest scanRequest = new ScanDtos.CreateScanRequest("javascript:alert('bad')");
        mockMvc.perform(post("/api/v1/sites/" + siteId + "/scans")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void continuesScanWhenAiIsUnavailable() throws Exception {
        failAi.set(true);
        String body = objectMapper.writeValueAsString(Map.of("url", "https://example.com"));

        mockMvc.perform(post("/api/v1/public/scans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(result -> {
                    JsonNode payload = objectMapper.readTree(result.getResponse().getContentAsString());
                    assertThat(payload.get("issues").get(0).get("description").asText()).contains("Missing alt");
                });
    }

    @Test
    void failsGracefullyWhenScannerDown() throws Exception {
        failScanner.set(true);
        AuthDtos.RegisterRequest registerRequest = new AuthDtos.RegisterRequest("scannerdown@example.com", "Password123");
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper.readTree(registerResult.getResponse().getContentAsString()).get("token").asText();

        Map<String, String> site = Map.of("name", "Demo Site", "url", "https://example.com");
        MvcResult siteResult = mockMvc.perform(post("/api/v1/sites")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(site)))
                .andExpect(status().isOk())
                .andReturn();
        String siteId = objectMapper.readTree(siteResult.getResponse().getContentAsString()).get("id").asText();

        ScanDtos.CreateScanRequest scanRequest = new ScanDtos.CreateScanRequest("https://example.com/page");
        mockMvc.perform(post("/api/v1/sites/" + siteId + "/scans")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isBadGateway());
    }

    private String scannerPayload() {
        return "{" +
                "\"url\":\"https://example.com/page\"," +
                "\"issues\":[{" +
                "\"id\":\"issue-1\"," +
                "\"type\":\"alt_missing\"," +
                "\"severity\":\"error\"," +
                "\"selector\":\"img.hero\"," +
                "\"description\":\"Missing alt text\"}]}";
    }

    private String aiPayload() {
        return "{" +
                "\"provider\":\"stub\"," +
                "\"requestId\":\"req-1\"," +
                "\"suggestions\":[{" +
                "\"issueId\":\"issue-1\"," +
                "\"selector\":\"img.hero\"," +
                "\"explanation\":\"Add alt text\"," +
                "\"suggestedFix\":\"Add alt text\"}]}";
    }
}
