package com.aiaca.api.service;

import com.aiaca.api.dto.EmbedConfigDto;
import com.aiaca.api.dto.SiteDtos;
import com.aiaca.api.exception.ResourceNotFoundException;
import com.aiaca.api.model.Site;
import com.aiaca.api.model.User;
import com.aiaca.api.repository.SiteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SiteService {
    private final SiteRepository siteRepository;

    public SiteService(SiteRepository siteRepository) {
        this.siteRepository = siteRepository;
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

    public Site getByEmbedKey(UUID id, String embedKey) {
        return siteRepository.findByIdAndEmbedKey(id, embedKey)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found for embed key"));
    }

    public SiteDtos.SiteResponse toResponse(Site site) {
        return new SiteDtos.SiteResponse(site.getId(), site.getName(), site.getUrl(), site.getEmbedKey(), site.getCreatedAt());
    }

    public EmbedConfigDto toEmbedConfig(Site site) {
        return new EmbedConfigDto(site.getId(), site.getEmbedKey(),
                List.of("alt_text", "focus_outline"), true);
    }
}
