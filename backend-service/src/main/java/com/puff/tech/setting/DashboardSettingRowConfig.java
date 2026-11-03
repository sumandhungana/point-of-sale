package com.puff.tech.setting;

import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

@Serdeable
public record DashboardSettingRowConfig(
        String id,
        List<String> widgets
) {
}
