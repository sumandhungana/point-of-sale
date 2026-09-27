package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUC;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCResponse;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUC;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUCResponse;
import com.puff.tech.security.Secured;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("member")
public class MemberController {

    private final GetSelectedMemberUC getSelectedMemberUC;
    private final GetUserWiseAllMemberUC getUserWiseAllMemberUC;

    public MemberController(GetSelectedMemberUC getSelectedMemberUC,
                            GetUserWiseAllMemberUC getUserWiseAllMemberUC) {
        this.getSelectedMemberUC = getSelectedMemberUC;
        this.getUserWiseAllMemberUC = getUserWiseAllMemberUC;
    }

    @Secured(roles = {"ADMIN", "Super Admin", "User"}, permissions = {"member:selected"})
    @Get("selected-member")
    public Mono<RestResponse<GetSelectedMemberUCResponse>> selectedMember() {
        return getSelectedMemberUC.execute(new GetSelectedMemberUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured
    @Get("user-all-member")
    public Mono<RestResponse<List<GetUserWiseAllMemberUCResponse>>> getAllMember(){
        return getUserWiseAllMemberUC.execute(new GetUserWiseAllMemberUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened on controller:: " +err.getLocalizedMessage())));
    }
}
