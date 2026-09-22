package com.puff.tech.staffmanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.staffmanagement.usecase.staff.create.CreateStaffUseCase;
import com.puff.tech.staffmanagement.usecase.staff.create.CreateStaffUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.create.CreateStaffUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staff.delete.DeleteStaffUseCase;
import com.puff.tech.staffmanagement.usecase.staff.delete.DeleteStaffUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.delete.DeleteStaffUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staff.get.GetStaffUCRequest;
import com.puff.tech.staffmanagement.usecase.staff.get.GetStaffUseCase;
import com.puff.tech.staffmanagement.usecase.staff.get.GetStaffUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staff.getattendance.GetAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staff.getattendance.GetAttendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.getone.GetOneStaffUseCase;
import com.puff.tech.staffmanagement.usecase.staff.getone.GetOneStaffUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.getsalary.GetStaffSalaryUseCase;
import com.puff.tech.staffmanagement.usecase.staff.update.UpdateStaffUseCase;
import com.puff.tech.staffmanagement.usecase.staff.update.UpdateStaffUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staff.update.UpdateStaffUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import io.micronaut.http.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller("/api/v1")
public class StaffController {

    private final CreateStaffUseCase createStaffUseCase;
    private final GetStaffUseCase getStaffUseCase;
    private final GetOneStaffUseCase getOneStaffUseCase;
    private final GetAttendanceUseCase getAttendanceUseCase;
    private final UpdateStaffUseCase updateStaffUseCase;
    private final DeleteStaffUseCase deleteStaffUseCase;
    private final GetStaffSalaryUseCase getStaffSalaryUseCase;

    public StaffController(CreateStaffUseCase createStaffUseCase,
                           GetStaffUseCase getStaffUseCase,
                           GetOneStaffUseCase getOneStaffUseCase,
                           GetAttendanceUseCase getAttendanceUseCase,
                           UpdateStaffUseCase updateStaffUseCase,
                           DeleteStaffUseCase deleteStaffUseCase,
                           GetStaffSalaryUseCase getStaffSalaryUseCase) {
        this.createStaffUseCase = createStaffUseCase;
        this.getStaffUseCase = getStaffUseCase;
        this.getOneStaffUseCase = getOneStaffUseCase;
        this.getAttendanceUseCase = getAttendanceUseCase;
        this.updateStaffUseCase = updateStaffUseCase;
        this.deleteStaffUseCase = deleteStaffUseCase;
        this.getStaffSalaryUseCase = getStaffSalaryUseCase;
    }

    @Secured
    @Post("/staff")
    public Mono<RestResponse<CreateStaffUseCaseResponse>> create(@Body CreateStaffUseCaseRequest request){
        return createStaffUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller " +err.getLocalizedMessage())));
    }

    @Secured
    @Get("/staffs")
    public Flux<RestResponse<GetStaffUseCaseResponse>> get(){
        return getStaffUseCase.execute(new GetStaffUCRequest())
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/{id}/attendance")
    public Flux<RestResponse<GetStaffAttendanceUseCaseResponse>> getAttendance(@PathVariable Integer id){
        var request= new GetAttendanceUseCaseRequest(id);
        return getAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/staff/{id}")
    public Mono<RestResponse<GetStaffUseCaseResponse>> getOne(@PathVariable Integer id){
        var request= new GetOneStaffUseCaseRequest(id);
        return getOneStaffUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Put("/staff/{id}")
    public Mono<RestResponse<UpdateStaffUseCaseResponse>> update(@Body UpdateStaffUseCaseRequest request){
        return updateStaffUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/staff/{id}")
    public Mono<RestResponse<DeleteStaffUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteStaffUseCaseRequest(id);
        return deleteStaffUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}

