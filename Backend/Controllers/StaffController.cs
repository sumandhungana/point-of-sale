using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StaffController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Staff
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StaffResponse>>> GetStaff()
    {
        var staff = await _context.Staff
            .Include(s => s.StaffSalaries)
            .Include(s => s.StaffAttendances)
            .Select(s => new StaffResponse
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Address = s.Address,
                Email = s.Email,
                Remarks = s.Remarks,
                ProfileImageUrl = s.ProfileImageUrl,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                StaffSalaries = s.StaffSalaries.Select(ss => new StaffSalaryResponse
                {
                    Id = ss.Id,
                    StaffId = ss.StaffId,
                    Month = ss.Month,
                    Year = ss.Year,
                    SelectedDate = ss.SelectedDate,
                    IsSlideOn = ss.IsSlideOn,
                    CalculationDate = ss.CalculationDate,
                    SalaryType = ss.SalaryType,
                    Amount = ss.Amount,
                    Permission = ss.Permission,
                    CreatedAt = ss.CreatedAt,
                    UpdatedAt = ss.UpdatedAt
                }).ToList(),
                StaffAttendances = s.StaffAttendances.Select(sa => new StaffAttendanceResponse
                {
                    Id = sa.Id,
                    StaffId = sa.StaffId,
                    Date = sa.Date,
                    Status = sa.Status,
                    Note = sa.Note,
                    CreatedAt = sa.CreatedAt,
                    UpdatedAt = sa.UpdatedAt
                }).ToList()
            })
            .ToListAsync();

        return staff;
    }

    // GET: api/Staff/5
    [HttpGet("{id}")]
    public async Task<ActionResult<StaffResponse>> GetStaff(int id)
    {
        var staff = await _context.Staff
            .Include(s => s.StaffSalaries)
            .Include(s => s.StaffAttendances)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (staff == null)
        {
            return NotFound();
        }

        return new StaffResponse
        {
            Id = staff.Id,
            Name = staff.Name,
            Phone = staff.Phone,
            Address = staff.Address,
            Email = staff.Email,
            Remarks = staff.Remarks,
            ProfileImageUrl = staff.ProfileImageUrl,
            CreatedAt = staff.CreatedAt,
            UpdatedAt = staff.UpdatedAt,
            StaffSalaries = staff.StaffSalaries.Select(ss => new StaffSalaryResponse
            {
                Id = ss.Id,
                StaffId = ss.StaffId,
                Month = ss.Month,
                Year = ss.Year,
                SelectedDate = ss.SelectedDate,
                IsSlideOn = ss.IsSlideOn,
                CalculationDate = ss.CalculationDate,
                SalaryType = ss.SalaryType,
                Amount = ss.Amount,
                Permission = ss.Permission,
                CreatedAt = ss.CreatedAt,
                UpdatedAt = ss.UpdatedAt
            }).ToList(),
            StaffAttendances = staff.StaffAttendances.Select(sa => new StaffAttendanceResponse
            {
                Id = sa.Id,
                StaffId = sa.StaffId,
                Date = sa.Date,
                Status = sa.Status,
                Note = sa.Note,
                CreatedAt = sa.CreatedAt,
                UpdatedAt = sa.UpdatedAt
            }).ToList()
        };
    }

    // POST: api/Staff
    [HttpPost]
    public async Task<ActionResult<Staff>> CreateStaff(Staff staff)
    {
        staff.CreatedAt = DateTime.UtcNow;
        staff.UpdatedAt = DateTime.UtcNow;
        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStaff), new { id = staff.Id }, staff);
    }

    // PUT: api/Staff/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStaff(int id, Staff staff)
    {
        if (id != staff.Id)
        {
            return BadRequest();
        }

        staff.UpdatedAt = DateTime.UtcNow;
        _context.Entry(staff).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!StaffExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Staff/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound();
        }

        _context.Staff.Remove(staff);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Staff/5/Attendance
    [HttpGet("{id}/Attendance")]
    public async Task<ActionResult<IEnumerable<StaffAttendanceResponse>>> GetStaffAttendance(int id)
    {
        var attendances = await _context.StaffAttendances
            .Where(a => a.StaffId == id)
            .OrderByDescending(a => a.Date)
            .ToListAsync();

        return attendances.Select(a => new StaffAttendanceResponse
        {
            Id = a.Id,
            StaffId = a.StaffId,
            Date = a.Date,
            Status = a.Status,
            Note = a.Note,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        }).ToList();
    }

    // GET: api/Staff/5/Salary
    [HttpGet("{id}/Salary")]
    public async Task<ActionResult<IEnumerable<StaffSalaryResponse>>> GetStaffSalary(int id)
    {
        var salaries = await _context.StaffSalaries
            .Where(s => s.StaffId == id)
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ToListAsync();

        return salaries.Select(s => new StaffSalaryResponse
        {
            Id = s.Id,
            StaffId = s.StaffId,
            Month = s.Month,
            Year = s.Year,
            SelectedDate = s.SelectedDate,
            IsSlideOn = s.IsSlideOn,
            CalculationDate = s.CalculationDate,
            SalaryType = s.SalaryType,
            Amount = s.Amount,
            Permission = s.Permission,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        }).ToList();
    }

    [HttpPost("{id}/attendance")]
    public async Task<ActionResult<StaffAttendanceResponse>> AddAttendance(int id, StaffAttendance attendance)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound();
        }

        attendance.StaffId = id;
        attendance.CreatedAt = DateTime.UtcNow;
        attendance.UpdatedAt = DateTime.UtcNow;
        _context.StaffAttendances.Add(attendance);
        await _context.SaveChangesAsync();

        return new StaffAttendanceResponse
        {
            Id = attendance.Id,
            StaffId = attendance.StaffId,
            Date = attendance.Date,
            Status = attendance.Status,
            Note = attendance.Note,
            CreatedAt = attendance.CreatedAt,
            UpdatedAt = attendance.UpdatedAt
        };
    }

    [HttpPost("{id}/salary")]
    public async Task<ActionResult<StaffSalaryResponse>> AddSalary(int id, StaffSalary salary)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound();
        }

        salary.StaffId = id;
        salary.CreatedAt = DateTime.UtcNow;
        salary.UpdatedAt = DateTime.UtcNow;
        _context.StaffSalaries.Add(salary);
        await _context.SaveChangesAsync();

        return new StaffSalaryResponse
        {
            Id = salary.Id,
            StaffId = salary.StaffId,
            Month = salary.Month,
            Year = salary.Year,
            SelectedDate = salary.SelectedDate,
            IsSlideOn = salary.IsSlideOn,
            CalculationDate = salary.CalculationDate,
            SalaryType = salary.SalaryType,
            Amount = salary.Amount,
            Permission = salary.Permission,
            CreatedAt = salary.CreatedAt,
            UpdatedAt = salary.UpdatedAt
        };
    }

    private bool StaffExists(int id)
    {
        return _context.Staff.Any(e => e.Id == id);
    }
} 