package com.puff.tech.setting.usecase.request;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record ResetAppSettingsUCRequest(

) implements UCRequest {
}
