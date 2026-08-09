package com.puff.tech.core.repositories;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class AuditLog {
    private Instant createdAt;
    private Instant createdBy;
    private Instant updatedAt;
    private Instant updatedBy;
}
