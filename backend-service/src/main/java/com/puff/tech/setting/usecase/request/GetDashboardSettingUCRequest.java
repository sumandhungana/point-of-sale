package com.puff.tech.setting.usecase.request;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record GetDashboardSettingUCRequest(
) implements UCRequest {
}

