package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.invoicesettings.create.CreateInvoiceSettingsUseCase;
import com.puff.tech.usecase.invoicesettings.create.CreateInvoiceSettingsUseCaseRequest;
import com.puff.tech.usecase.invoicesettings.create.CreateInvoiceSettingsUseCaseResponse;
import com.puff.tech.usecase.invoicesettings.delete.DeleteInvoiceSettingUseCase;
import com.puff.tech.usecase.invoicesettings.delete.DeleteInvoiceSettingUseCaseRequest;
import com.puff.tech.usecase.invoicesettings.delete.DeleteInvoiceSettingUseCaseResponse;
import com.puff.tech.usecase.invoicesettings.get.GetAllInvoiceSettingsUseCase;
import com.puff.tech.usecase.invoicesettings.get.GetInvoiceSettingsUseCaseResponse;
import com.puff.tech.usecase.invoicesettings.getone.GetOneInvoiceSettingsUseCase;
import com.puff.tech.usecase.invoicesettings.getone.GetOneInvoiceSettingsUseCaseRequest;
import com.puff.tech.usecase.invoicesettings.update.UpdateInvoiceSettingsUseCase;
import com.puff.tech.usecase.invoicesettings.update.UpdateInvoiceSettingsUseCaseRequest;
import com.puff.tech.usecase.invoicesettings.update.UpdateInvoiceSettingsUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class InvoiceSettingsController {

    private final CreateInvoiceSettingsUseCase createInvoiceSettingsUseCase;
    private final GetAllInvoiceSettingsUseCase getAllInvoiceSettingsUseCase;
    private final GetOneInvoiceSettingsUseCase getOneInvoiceSettingsUseCase;
    private final UpdateInvoiceSettingsUseCase updateInvoiceSettingsUseCase;
    private final DeleteInvoiceSettingUseCase deleteInvoiceSettingUseCase;

    @Inject
    public InvoiceSettingsController(CreateInvoiceSettingsUseCase createInvoiceSettingsUseCase,
                                     GetAllInvoiceSettingsUseCase getAllInvoiceSettingsUseCase,
                                     GetOneInvoiceSettingsUseCase getOneInvoiceSettingsUseCase,
                                     UpdateInvoiceSettingsUseCase updateInvoiceSettingsUseCase,
                                     DeleteInvoiceSettingUseCase deleteInvoiceSettingUseCase) {
        this.createInvoiceSettingsUseCase = createInvoiceSettingsUseCase;
        this.getAllInvoiceSettingsUseCase = getAllInvoiceSettingsUseCase;
        this.getOneInvoiceSettingsUseCase = getOneInvoiceSettingsUseCase;
        this.updateInvoiceSettingsUseCase = updateInvoiceSettingsUseCase;
        this.deleteInvoiceSettingUseCase = deleteInvoiceSettingUseCase;
    }

    @Post("/invoicesettings")
    public Mono<RestResponse<CreateInvoiceSettingsUseCaseResponse>> create(@Body CreateInvoiceSettingsUseCaseRequest request){
        return createInvoiceSettingsUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/invoicesettings")
    public Flux<RestResponse<GetInvoiceSettingsUseCaseResponse>> get(){
        return getAllInvoiceSettingsUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/invoicesettings/{id}")
    public Mono<RestResponse<GetInvoiceSettingsUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOneInvoiceSettingsUseCaseRequest(id);
        return getOneInvoiceSettingsUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/invoicesettings")
    public Mono<RestResponse<UpdateInvoiceSettingsUseCaseResponse>> update(@Body UpdateInvoiceSettingsUseCaseRequest request){
        return updateInvoiceSettingsUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Delete("/invoicesettings/{id}")
    public Mono<RestResponse<DeleteInvoiceSettingUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteInvoiceSettingUseCaseRequest(id);
        return deleteInvoiceSettingUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
