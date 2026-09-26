package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUC;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCResponse;
import com.puff.tech.onboarding.usecase.member.getall.GetAllMemberUseCase;
import com.puff.tech.onboarding.usecase.member.getall.GetAllMemberUseCaseRequest;
import com.puff.tech.onboarding.usecase.member.getall.GetAllMemberUseCaseResponse;
import com.puff.tech.security.Secured;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("/member")
public class MemberController {

    private final GetSelectedMemberUC getSelectedMemberUC;
    private final GetAllMemberUseCase getAllMemberUseCase;

    public MemberController(GetSelectedMemberUC getSelectedMemberUC,
                            GetAllMemberUseCase getAllMemberUseCase) {
        this.getSelectedMemberUC = getSelectedMemberUC;
        this.getAllMemberUseCase= getAllMemberUseCase;
    }

    @Secured(roles = {"ADMIN"}, permissions = {"member:selected"})
    @Get("selected-member")
    public Mono<RestResponse<GetSelectedMemberUCResponse>> selectedMember() {
        return getSelectedMemberUC.execute(new GetSelectedMemberUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured
    @Get("/all-member")
    public Mono<RestResponse<List<GetAllMemberUseCaseResponse>>> getAllMember(){
        return getAllMemberUseCase.execute(new GetAllMemberUseCaseRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened on controller:: " +err.getLocalizedMessage())));
    }
}
