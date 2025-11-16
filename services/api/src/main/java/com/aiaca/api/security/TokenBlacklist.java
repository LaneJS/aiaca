package com.aiaca.api.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenBlacklist {
    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String token, Date expiresAt) {
        blacklist.put(token, expiresAt);
    }

    public boolean isBlacklisted(String token) {
        Date expiry = blacklist.get(token);
        if (expiry == null) {
            return false;
        }
        if (expiry.before(new Date())) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    @Scheduled(fixedDelay = 60000)
    public void evictExpired() {
        Date now = new Date();
        blacklist.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}
