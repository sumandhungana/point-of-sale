package com.puff.tech.staffmanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.staffmanagement.usecase.staffsalary.delete.DeleteStaffSalaryUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffsalary.delete.DeleteStaffSalaryUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffsalary.get.GetStaffSalaryUseCase;
import com.puff.tech.staffmanagement.usecase.staffsalary.create.CreateStaffSalaryUseCase;
import com.puff.tech.staffmanagement.usecase.staffsalary.create.CreateStaffSalaryUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffsalary.create.CreateStaffSalaryUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffsalary.delete.DeleteStaffSalaryUseCase;
import com.puff.tech.staffmanagement.usecase.staffsalary.get.GetStaffSalaryUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffsalary.getbystaffid.GetStaffSalaryByStaffIdUseCase;
import com.puff.tech.staffmanagement.usecase.staffsalary.getbystaffid.GetStaffSalaryByStaffIdUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffsalary.getone.GetOneStaffSalaryUseCase;
import com.puff.tech.staffmanagement.usecase.staffsalary.getone.GetOneStaffSalaryUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffsalary.update.UpdateStaffSalaryUseCase;
import com.puff.tech.staffmanagement.usecase.staffsalary.update.UpdateStaffSalaryUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffsalary.update.UpdateStaffSalaryUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("")
public class StaffSalaryController {

    private final CreateStaffSalaryUseCase createStaffSalaryUseCase;
    private final GetStaffSalaryUseCase getStaffSalaryUseCase;
    private final GetStaffSalaryByStaffIdUseCase getStaffSalaryByStaffIdUseCase;
    private final GetOneStaffSalaryUseCase getOneStaffSalaryUseCase;
    private final UpdateStaffSalaryUseCase updateStaffSalaryUseCase;
    private final DeleteStaffSalaryUseCase deleteStaffSalaryUseCase;

    @Inject
    public StaffSalaryController(CreateStaffSalaryUseCase createStaffSalaryUseCase,
                                 GetStaffSalaryUseCase getStaffSalaryUseCase,
                                 GetStaffSalaryByStaffIdUseCase getStaffSalaryByStaffIdUseCase,
                                 GetOneStaffSalaryUseCase getOneStaffSalaryUseCase,
                                 UpdateStaffSalaryUseCase updateStaffSalaryUseCase,
                                 DeleteStaffSalaryUseCase deleteStaffSalaryUseCase) {
        this.createStaffSalaryUseCase = createStaffSalaryUseCase;
        this.getStaffSalaryUseCase = getStaffSalaryUseCase;
        this.getStaffSalaryByStaffIdUseCase = getStaffSalaryByStaffIdUseCase;
        this.getOneStaffSalaryUseCase = getOneStaffSalaryUseCase;
        this.updateStaffSalaryUseCase = updateStaffSalaryUseCase;
        this.deleteStaffSalaryUseCase = deleteStaffSalaryUseCase;
    }

    @Secured
    @Post("/staff-salary")
    public Mono<RestResponse<CreateStaffSalaryUseCaseResponse>> create(@Body CreateStaffSalaryUseCaseRequest request){
        return  createStaffSalaryUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/staff-salaries")
    public Flux<RestResponse<GetStaffSalaryUseCaseResponse>> get(){
        return getStaffSalaryUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/staff-salaries/{staffId}")
    public Flux<RestResponse<GetStaffSalaryUseCaseResponse>> getByStaffId(@PathVariable Integer staffId) {
        var request = new GetStaffSalaryByStaffIdUseCaseRequest(staffId);
        return getStaffSalaryByStaffIdUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Flux.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Get("/staff-salary/{id}")
    public Mono<RestResponse<GetStaffSalaryUseCaseResponse>> getOne(@PathVariable Integer id){
        var request=new GetOneStaffSalaryUseCaseRequest(id);
        return getOneStaffSalaryUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Put("/staff-salary")
    public Mono<RestResponse<UpdateStaffSalaryUseCaseResponse>> update(@Body UpdateStaffSalaryUseCaseRequest request){
        return updateStaffSalaryUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }

    @Delete("/staff-salary/{id}")
    public Mono<RestResponse<DeleteStaffSalaryUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteStaffSalaryUseCaseRequest(id);
        return deleteStaffSalaryUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err->Mono.just(RestResponse.error("Unexpected happened" +err.getLocalizedMessage())));
    }
}
