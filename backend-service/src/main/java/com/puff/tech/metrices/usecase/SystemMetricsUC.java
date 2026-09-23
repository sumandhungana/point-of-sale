package com.puff.tech.metrices.usecase;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.nio.file.FileSystems;
import java.time.Instant;

@Singleton
public class SystemMetricsUC implements MonoUC<SystemMetricsUCRequest, SystemMetricsUCResponse> {

    private final OperatingSystemMXBean osBean =
            ManagementFactory.getOperatingSystemMXBean();

    @Override
    public Mono<SystemMetricsUCResponse> execute(SystemMetricsUCRequest request, UseCaseContext context) {
        return Mono.fromSupplier(() -> new SystemMetricsUCResponse(
                getCpuUsage(),
                getMemoryUsage(),
                getDiskUsage(),
                Instant.now()
        ));
    }
    private double getCpuUsage() {
        if (osBean instanceof com.sun.management.OperatingSystemMXBean bean) {
            double cpuLoad = bean.getCpuLoad();

            return cpuLoad < 0 ? 0.0 : cpuLoad * 100;
        }

        return 0.0;
    }

    private double getMemoryUsage() {
        if (osBean instanceof com.sun.management.OperatingSystemMXBean bean) {

            long totalMemory = bean.getTotalMemorySize();
            long freeMemory = bean.getFreeMemorySize();

            if (totalMemory == 0) {
                return 0.0;
            }

            return ((double) (totalMemory - freeMemory)
                    / totalMemory) * 100;
        }

        return 0.0;
    }

    private double getDiskUsage() {
        try {
            var fileStore = FileSystems
                    .getDefault()
                    .getFileStores()
                    .iterator()
                    .next();

            long totalSpace = fileStore.getTotalSpace();
            long usableSpace = fileStore.getUsableSpace();

            if (totalSpace == 0) {
                return 0.0;
            }

            return ((double) (totalSpace - usableSpace)
                    / totalSpace) * 100;

        } catch (IOException e) {
            return 0.0;
        }
    }
}
