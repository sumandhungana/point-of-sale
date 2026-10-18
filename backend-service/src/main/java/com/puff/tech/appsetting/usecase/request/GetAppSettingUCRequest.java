package com.puff.tech.appsetting.usecase.request;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAppSettingUCRequest(

) implements UCRequest {
}
