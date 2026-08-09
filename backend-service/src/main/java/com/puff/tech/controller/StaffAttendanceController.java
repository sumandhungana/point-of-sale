package com.puff.tech.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.usecase.salesbillitems.delete.DeleteSalesBillItemUseCaseRequest;
import com.puff.tech.usecase.staffattendance.create.CreateStaffAtendanceUseCase;
import com.puff.tech.usecase.staffattendance.create.CreateStaffAtendanceUseCaseRequest;
import com.puff.tech.usecase.staffattendance.create.CreateStaffAtendanceUseCaseResponse;
import com.puff.tech.usecase.staffattendance.delete.DeleteStaffAttendanceUseCase;
import com.puff.tech.usecase.staffattendance.delete.DeleteStaffAttendanceUseCaseRequest;
import com.puff.tech.usecase.staffattendance.delete.DeleteStaffAttendanceUseCaseResponse;
import com.puff.tech.usecase.staffattendance.get.GetStaffAttendanceUseCase;
import com.puff.tech.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import com.puff.tech.usecase.staffattendance.getbydate.GetStaffAttendanceByDateUseCase;
import com.puff.tech.usecase.staffattendance.getbydate.GetStaffAttendanceByDateUseCaseRequest;
import com.puff.tech.usecase.staffattendance.getbyid.GetStaffAttendanceByIdUseCase;
import com.puff.tech.usecase.staffattendance.getbyid.GetStaffAttendanceByIdUseCaseRequest;
import com.puff.tech.usecase.staffattendance.getbystaff.GetStaffAttendanceBySatffIdUseCase;
import com.puff.tech.usecase.staffattendance.getbystaff.GetStaffAttendanceBySatffIdUseCaseRequest;
import com.puff.tech.usecase.staffattendance.update.UpdateSatffAttendanceUseCase;
import com.puff.tech.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;
import com.puff.tech.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Controller("/api/v1")
public class StaffAttendanceController {

    private final CreateStaffAtendanceUseCase createStaffAtendanceUseCase;
    private final GetStaffAttendanceUseCase getStaffAttendanceUseCase;
    private final GetStaffAttendanceByDateUseCase getStaffAttendanceByDateUseCase;
    private final GetStaffAttendanceByIdUseCase getStaffAttendanceByIdUseCase;
    private final GetStaffAttendanceBySatffIdUseCase getStaffAttendanceBySatffIdUseCase;
    private final UpdateSatffAttendanceUseCase updateSatffAttendanceUseCase;
    private final DeleteStaffAttendanceUseCase deleteStaffAttendanceUseCase;

    @Inject
    public StaffAttendanceController(CreateStaffAtendanceUseCase createStaffAtendanceUseCase,
                                     GetStaffAttendanceUseCase getStaffAttendanceUseCase,
                                     GetStaffAttendanceByDateUseCase getStaffAttendanceByDateUseCase,
                                     GetStaffAttendanceByIdUseCase getStaffAttendanceByIdUseCase,
                                     GetStaffAttendanceBySatffIdUseCase getStaffAttendanceBySatffIdUseCase,
                                     UpdateSatffAttendanceUseCase updateSatffAttendanceUseCase,
                                     DeleteStaffAttendanceUseCase deleteStaffAttendanceUseCase) {
        this.createStaffAtendanceUseCase = createStaffAtendanceUseCase;
        this.getStaffAttendanceUseCase = getStaffAttendanceUseCase;
        this.getStaffAttendanceByDateUseCase = getStaffAttendanceByDateUseCase;
        this.getStaffAttendanceByIdUseCase = getStaffAttendanceByIdUseCase;
        this.getStaffAttendanceBySatffIdUseCase = getStaffAttendanceBySatffIdUseCase;
        this.updateSatffAttendanceUseCase = updateSatffAttendanceUseCase;
        this.deleteStaffAttendanceUseCase = deleteStaffAttendanceUseCase;
    }

    @Post("/staff-attendance")
    public Mono<RestResponse<CreateStaffAtendanceUseCaseResponse>> create(@Body CreateStaffAtendanceUseCaseRequest request){
        return createStaffAtendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/staff-attendance")
    public Flux<RestResponse<GetStaffAttendanceUseCaseResponse>> get(){
        return getStaffAttendanceUseCase.execute()
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/staff-attendance/{date}")
    public Flux<RestResponse<GetStaffAttendanceUseCaseResponse>> getByDate(Instant date){
        var request= new GetStaffAttendanceByDateUseCaseRequest(date);
        return getStaffAttendanceByDateUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/staff-attendance/{staffId}")
    public Flux<RestResponse<GetStaffAttendanceUseCaseResponse>> getByStaff(@PathVariable Integer staffId){
        var request= new GetStaffAttendanceBySatffIdUseCaseRequest(staffId);
        return getStaffAttendanceBySatffIdUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Flux.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Get("/staff-attendance/{id}")
    public Mono<RestResponse<GetStaffAttendanceUseCaseResponse>> getById(@PathVariable Integer id){
        var request= new GetStaffAttendanceByIdUseCaseRequest(id);
        return getStaffAttendanceByIdUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));

    }

    @Put("/staff-attendance")
    public Mono<RestResponse<UpdateSatffAttendanceUseCaseResponse>> update(@Body UpdateSatffAttendanceUseCaseRequest request){
        return updateSatffAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }

    @Delete("/staff-attendance/{id}")
    public Mono<RestResponse<DeleteStaffAttendanceUseCaseResponse>> delete(@PathVariable Integer id){
        var request= new DeleteStaffAttendanceUseCaseRequest(id);
        return deleteStaffAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err-> Mono.just(RestResponse.error("Unexpected on controller" +err.getLocalizedMessage())));
    }
}
