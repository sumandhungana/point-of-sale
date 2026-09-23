package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUC;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCResponse;
import com.puff.tech.security.Secured;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import reactor.core.publisher.Mono;

@Controller("/member")
public class MemberController {

    private final GetSelectedMemberUC getSelectedMemberUC;

    public MemberController(GetSelectedMemberUC getSelectedMemberUC) {
        this.getSelectedMemberUC = getSelectedMemberUC;
    }

    @Secured
    @Get("selected-member")
    public Mono<RestResponse<GetSelectedMemberUCResponse>> login() {
        return getSelectedMemberUC.execute(new GetSelectedMemberUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened" + err.getLocalizedMessage())));
    }
}
