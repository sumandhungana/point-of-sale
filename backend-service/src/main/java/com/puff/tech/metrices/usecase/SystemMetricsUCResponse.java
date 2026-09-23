package com.puff.tech.metrices.usecase;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record SystemMetricsUCResponse(
        double cpuUsage,
        double memoryUsage,
        double diskUsage,
        Instant timestamp
) implements UCResponse {
}
