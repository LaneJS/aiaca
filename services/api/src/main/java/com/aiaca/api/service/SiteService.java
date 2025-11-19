package com.aiaca.api.service;

import com.aiaca.api.dto.EmbedConfigDto;
import com.aiaca.api.dto.SiteDtos;
import com.aiaca.api.exception.BadRequestException;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.Scan;
import com.aiaca.api.model.ScanStatus;
import com.aiaca.api.model.Site;
import com.aiaca.api.model.User;
import com.aiaca.api.repository.ScanRepository;
import com.aiaca.api.repository.SiteRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SiteService {
    private final SiteRepository siteRepository;
    private final ScanRepository scanRepository;

    public SiteService(SiteRepository siteRepository, ScanRepository scanRepository) {
        this.siteRepository = siteRepository;
        this.scanRepository = scanRepository;
    }

    public Site createSite(User owner, SiteDtos.CreateSiteRequest request) {
        Site site = new Site();
        site.setName(request.name());
        site.setUrl(request.url());
        site.setOwner(owner);
        return siteRepository.save(site);
    }

    public List<Site> listSites(User owner) {
        return siteRepository.findByOwner(owner);
    }

    public Site getSite(User owner, UUID id) {
        return siteRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found"));
    }

    public Site updateSite(User owner, UUID id, SiteDtos.UpdateSiteRequest request) {
        Site site = getSite(owner, id);

        if (request.name() == null && request.url() == null) {
            throw new BadRequestException("At least one field (name or url) must be provided");
        }

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new BadRequestException("Name cannot be empty");
            }
            site.setName(request.name());
        }

        if (request.url() != null) {
            if (request.url().isBlank()) {
                throw new BadRequestException("URL cannot be empty");
            }
            site.setUrl(request.url());
        }

        return siteRepository.save(site);
    }

    public void deleteSite(User owner, UUID id) {
        Site site = getSite(owner, id);
        siteRepository.delete(site);
    }

    public Site getByEmbedKey(UUID id, String embedKey) {
        return siteRepository.findByIdAndEmbedKey(id, embedKey)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found for embed key"));
    }

    public SiteDtos.SiteResponse toResponse(Site site) {
        return new SiteDtos.SiteResponse(site.getId(), site.getName(), site.getUrl(), site.getEmbedKey(), site.getCreatedAt());
    }

    public EmbedConfigDto toEmbedConfig(Site site) {
        // Fetch the latest completed scan for this site
        Optional<Scan> latestScan = scanRepository.findFirstBySiteAndStatusOrderByCreatedAtDesc(
            site,
            ScanStatus.COMPLETED
        );

        List<EmbedConfigDto.AltTextSuggestion> altTextSuggestions = new ArrayList<>();

        if (latestScan.isPresent()) {
            Scan scan = latestScan.get();

            // Extract alt text suggestions from scan issues
            scan.getIssues().stream()
                .filter(issue -> {
                    // Look for issues related to missing alt text
                    String type = issue.getType();
                    return type != null && (
                        type.contains("alt") ||
                        type.contains("image") ||
                        type.equals("missing_alt_text")
                    );
                })
                .forEach(issue -> {
                    if (issue.getSuggestion() != null && !issue.getSuggestion().isBlank()) {
                        altTextSuggestions.add(new EmbedConfigDto.AltTextSuggestion(
                            issue.getSelector(),  // CSS selector from issue
                            null,                 // imageUrl - can be extracted if stored
                            issue.getSuggestion() // AI-generated alt text
                        ));
                    }
                });
        }

        return new EmbedConfigDto(
            site.getId(),
            site.getEmbedKey(),
            List.of("alt_text", "focus_outline"),
            true,  // enableSkipLink
            altTextSuggestions,
            "#1f6feb",  // Default GitHub blue color
            "Skip to main content"
        );
    }
}
