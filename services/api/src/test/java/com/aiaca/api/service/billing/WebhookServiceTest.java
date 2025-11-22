package com.aiaca.api.service.billing;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.repository.billing.WebhookEventRepository;
import org.junit.jupiter.api.Test;

class WebhookServiceTest {

    @Test
    void processStripeEvent_requiresSecret() {
        WebhookEventRepository repo = mock(WebhookEventRepository.class);
        WebhookService service = new WebhookService(repo, "", 300L);

        assertThatThrownBy(() -> service.processStripeEvent("{}", "sig"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("secret");
    }
}
