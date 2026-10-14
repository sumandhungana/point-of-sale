package com.puff.tech.staffmanagement.controller;

import com.puff.tech.core.responses.RestResponse;
import com.puff.tech.security.Secured;
import com.puff.tech.usermanagement.enums.Permission;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAtendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAtendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.create.CreateStaffAtendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.delete.DeleteStaffAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.delete.DeleteStaffAttendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.delete.DeleteStaffAttendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.get.GetStaffAttendanceUseCaseResponse;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbydate.GetStaffAttendanceByDateUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbydate.GetStaffAttendanceByDateUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbyid.GetStaffAttendanceByIdUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbyid.GetStaffAttendanceByIdUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff.GetStaffAttendanceBySatffIdUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.getbystaff.GetStaffAttendanceBySatffIdUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCase;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseRequest;
import com.puff.tech.staffmanagement.usecase.staffattendance.update.UpdateSatffAttendanceUseCaseResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Controller("")
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

    @Secured(permissions = {Permission.STAFF_CREATE, Permission.STAFF_UPDATE, Permission.STAFF_FIND_ALL})
    @Post("/staff-attendance")
    public Mono<RestResponse<CreateStaffAtendanceUseCaseResponse>> create(@Body CreateStaffAtendanceUseCaseRequest request){
        return createStaffAtendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error creating attendance: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_FIND_ALL, Permission.STAFF_FIND_ONE})
    @Get("/staff-attendance")
    public Mono<RestResponse<List<GetStaffAttendanceUseCaseResponse>>> get(){
        return getStaffAttendanceUseCase.execute()
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendances: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_FIND_ALL, Permission.STAFF_FIND_ONE})
    @Get("/staff-attendance/date/{date}")
    public Mono<RestResponse<List<GetStaffAttendanceUseCaseResponse>>> getByDate(@PathVariable Instant date){
        var request = new GetStaffAttendanceByDateUseCaseRequest(date);
        return getStaffAttendanceByDateUseCase.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendances by date: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_FIND_ALL, Permission.STAFF_FIND_ONE})
    @Get("/staff-attendance/staff/{staffId}")
    public Mono<RestResponse<List<GetStaffAttendanceUseCaseResponse>>> getByStaff(@PathVariable Integer staffId){
        var request = new GetStaffAttendanceBySatffIdUseCaseRequest(staffId);
        return getStaffAttendanceBySatffIdUseCase.execute(request)
                .collectList()
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendances by staff: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_FIND_ALL, Permission.STAFF_FIND_ONE})
    @Get("/staff-attendance/{id}")
    public Mono<RestResponse<GetStaffAttendanceUseCaseResponse>> getById(@PathVariable Integer id){
        var request = new GetStaffAttendanceByIdUseCaseRequest(id);
        return getStaffAttendanceByIdUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error fetching attendance: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_UPDATE, Permission.STAFF_CREATE})
    @Put("/staff-attendance")
    public Mono<RestResponse<UpdateSatffAttendanceUseCaseResponse>> update(@Body UpdateSatffAttendanceUseCaseRequest request){
        return updateSatffAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error updating attendance: " + err.getLocalizedMessage())));
    }

    @Secured(permissions = {Permission.STAFF_DELETE, Permission.STAFF_UPDATE})
    @Delete("/staff-attendance/{id}")
    public Mono<RestResponse<DeleteStaffAttendanceUseCaseResponse>> delete(@PathVariable Integer id){
        var request = new DeleteStaffAttendanceUseCaseRequest(id);
        return deleteStaffAttendanceUseCase.execute(request)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error deleting attendance: " + err.getLocalizedMessage())));
    }
}
