package com.aiaca.api.service;

import com.aiaca.api.dto.SiteDtos;
import com.aiaca.api.model.Site;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SiteSettingsService {
    private final Map<UUID, SiteDtos.SiteScheduleDto> schedules = new ConcurrentHashMap<>();
    private final Map<UUID, SiteDtos.NotificationSettingsDto> notifications = new ConcurrentHashMap<>();

    public SiteDtos.SiteScheduleDto getSchedule(Site site) {
        return schedules.getOrDefault(site.getId(), defaultSchedule());
    }

    public SiteDtos.SiteScheduleDto updateSchedule(Site site, SiteDtos.SiteScheduleDto update) {
        SiteDtos.SiteScheduleDto merged = new SiteDtos.SiteScheduleDto(
                update.cadence() == null ? "weekly" : update.cadence(),
                update.timeUtc() == null ? "02:00" : update.timeUtc(),
                update.timezone() == null ? "UTC" : update.timezone(),
                update.windowStart(),
                update.windowEnd(),
                update.nextRun(),
                update.lastRun(),
                update.isActive()
        );
        schedules.put(site.getId(), merged);
        return merged;
    }

    public SiteDtos.NotificationSettingsDto getNotifications(Site site) {
        return notifications.getOrDefault(site.getId(), defaultNotifications());
    }

    public SiteDtos.NotificationSettingsDto updateNotifications(Site site, SiteDtos.NotificationSettingsDto update) {
        SiteDtos.NotificationSettingsDto merged = new SiteDtos.NotificationSettingsDto(
                update.emailEnabled(),
                update.slackWebhookUrl(),
                update.webhookUrl(),
                update.digestCadence()
        );
        notifications.put(site.getId(), merged);
        return merged;
    }

    private SiteDtos.SiteScheduleDto defaultSchedule() {
        return new SiteDtos.SiteScheduleDto(
                "weekly",
                "02:00",
                "UTC",
                null,
                null,
                null,
                null,
                false
        );
    }

    private SiteDtos.NotificationSettingsDto defaultNotifications() {
        return new SiteDtos.NotificationSettingsDto(false, null, null, "weekly");
    }
}
