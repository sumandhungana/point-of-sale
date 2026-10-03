package com.puff.tech.onboarding.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.onboarding.controller.converter.UserEnrollmentConverter;
import com.puff.tech.onboarding.controller.payload.UserRegistrationReqPayload;
import com.puff.tech.onboarding.usecase.getallorganization.GetAllOrganizationUC;
import com.puff.tech.onboarding.usecase.getallorganization.GetAllOrganizationUCRequest;
import com.puff.tech.onboarding.usecase.getallorganization.GetAllOrganizationUCResponse;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUC;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.get.GetSelectedMemberUCResponse;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUC;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUCRequest;
import com.puff.tech.onboarding.usecase.member.getall.GetUserWiseAllMemberUCResponse;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUcResponse;
import com.puff.tech.onboarding.usecase.registration.UserRegistrationUseCase;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("member")
public class MemberController {

    private final GetSelectedMemberUC getSelectedMemberUC;
    private final GetUserWiseAllMemberUC getUserWiseAllMemberUC;
    private final UserRegistrationUseCase userRegistrationUseCase;
    private final GetAllOrganizationUC getAllOrganizationUC;

    public MemberController(GetSelectedMemberUC getSelectedMemberUC,
                            GetUserWiseAllMemberUC getUserWiseAllMemberUC, UserRegistrationUseCase userRegistrationUseCase, GetAllOrganizationUC getAllOrganizationUC) {
        this.getSelectedMemberUC = getSelectedMemberUC;
        this.getUserWiseAllMemberUC = getUserWiseAllMemberUC;
        this.userRegistrationUseCase = userRegistrationUseCase;
        this.getAllOrganizationUC = getAllOrganizationUC;

    }

    @Secured(permissions = {Permission.ORGANIZATION_REGISTRATION})
    @Post("/organization-register")
    public Mono<RestResponse<UserRegistrationUcResponse>> register(@Body UserRegistrationReqPayload payload) {
        return userRegistrationUseCase.execute(UserEnrollmentConverter.toUcRequest(payload, false))
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error on Controller:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.ORGANIZATION_List})
    @Get("organization-list")
    public Mono<RestResponse<List<GetAllOrganizationUCResponse>>> getAllOrganization() {
        return getAllOrganizationUC.execute(new GetAllOrganizationUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.OWN_KHATA_BOOK_SELECTED})
    @Get("selected-member")
    public Mono<RestResponse<GetSelectedMemberUCResponse>> selectedMember() {
        return getSelectedMemberUC.execute(new GetSelectedMemberUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Unexpected happened:: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.OWN_KHATA_BOOK_ALL_MEMBER})
    @Get("user-all-member")
    public Mono<RestResponse<List<GetUserWiseAllMemberUCResponse>>> getAllMember(){
        return getUserWiseAllMemberUC.execute(new GetUserWiseAllMemberUCRequest())
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened on controller:: " +err.getLocalizedMessage())));
    }
}
