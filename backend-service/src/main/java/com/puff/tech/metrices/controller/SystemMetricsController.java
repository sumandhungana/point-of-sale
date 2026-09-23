package com.puff.tech.metrices.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.metrices.usecase.SystemMetricsUC;
import com.puff.tech.metrices.usecase.SystemMetricsUCRequest;
import com.puff.tech.metrices.usecase.SystemMetricsUCResponse;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCResponse;
import com.puff.tech.security.Secured;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import reactor.core.publisher.Mono;

@Controller("metrics")
public class SystemMetricsController {

    private final SystemMetricsUC systemMetricsUC;

    public SystemMetricsController(SystemMetricsUC systemMetricsUC) {
        this.systemMetricsUC = systemMetricsUC;
    }

    @Secured
    @Get("system-monitor")
    public Mono<RestResponse<SystemMetricsUCResponse>> metrics() {
        return systemMetricsUC.execute(new SystemMetricsUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened" + err.getLocalizedMessage())));
    }
}
