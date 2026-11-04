package com.puff.tech.depositmanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.depositmanagement.usecase.add.AddDepositUC;
import com.puff.tech.depositmanagement.usecase.add.AddDepositUCRequest;
import com.puff.tech.depositmanagement.usecase.add.AddDepositUCResponse;
import com.puff.tech.depositmanagement.usecase.delete.DeleteDepositUC;
import com.puff.tech.depositmanagement.usecase.delete.DeleteDepositUCRequest;
import com.puff.tech.depositmanagement.usecase.delete.DeleteDepositUCResponse;
import com.puff.tech.depositmanagement.usecase.edit.UpdateDepositUC;
import com.puff.tech.depositmanagement.usecase.edit.UpdateDepositUCRequest;
import com.puff.tech.depositmanagement.usecase.edit.UpdateDepositUCResponse;
import com.puff.tech.depositmanagement.usecase.get.GetDepositUC;
import com.puff.tech.depositmanagement.usecase.get.GetDepositUCRequest;
import com.puff.tech.depositmanagement.usecase.get.GetDepositUCResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import io.micronaut.http.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller("deposit")
public class DepositController {

    private final AddDepositUC addDepositUC;
    private final GetDepositUC getDepositUC;
    private final UpdateDepositUC updateDepositUC;
    private final DeleteDepositUC deleteDepositUC;

    public DepositController(AddDepositUC addDepositUC, GetDepositUC getDepositUC, UpdateDepositUC updateDepositUC, DeleteDepositUC deleteDepositUC) {
        this.addDepositUC = addDepositUC;
        this.getDepositUC = getDepositUC;
        this.updateDepositUC = updateDepositUC;
        this.deleteDepositUC = deleteDepositUC;
    }

    @Secured(permissions = Permission.DEPOSIT_ADD)
    @Post("add")
    public Mono<RestResponse<AddDepositUCResponse>> add(@Body AddDepositUCRequest addDepositUCRequest){
        return addDepositUC.execute(addDepositUCRequest)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }

    @Secured(permissions = Permission.DEPOSIT_GET)
    @Get("all/{id}")
    public Mono<RestResponse<List<GetDepositUCResponse>>> getAll(@PathVariable("id") long id){
        var request = new GetDepositUCRequest(id);
        return getDepositUC.execute(request)
                .collectList()
                .map((RestResponse::success))
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }

    @Secured(permissions = Permission.DEPOSIT_UPDATE)
    @Put()
    public Mono<RestResponse<UpdateDepositUCResponse>> update(@Body UpdateDepositUCRequest request){
        return updateDepositUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }

    @Secured(permissions = Permission.DEPOSIT_DELETE)
    @Delete("{id}")
    public Mono<RestResponse<DeleteDepositUCResponse>> delete(@PathVariable("id") long id){
        var request = new DeleteDepositUCRequest(id);
        return deleteDepositUC.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected happened:: " +err.getLocalizedMessage())));
    }
}
