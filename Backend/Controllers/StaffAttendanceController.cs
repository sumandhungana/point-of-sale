using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffAttendanceController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IKhataBookContext _khataBookContext;

    public StaffAttendanceController(ApplicationDbContext context, IKhataBookContext khataBookContext)
    {
        _context = context;
        _khataBookContext = khataBookContext;
    }

    // GET: api/StaffAttendance
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StaffAttendance>>> GetStaffAttendances()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.StaffAttendances
            .Include(a => a.Staff)
            .Where(a => a.KhataBookId == currentKhataBookId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    // GET: api/StaffAttendance/5
    [HttpGet("{id}")]
    public async Task<ActionResult<StaffAttendance>> GetStaffAttendance(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var staffAttendance = await _context.StaffAttendances
            .Include(a => a.Staff)
            .FirstOrDefaultAsync(a => a.Id == id && a.KhataBookId == currentKhataBookId);

        if (staffAttendance == null)
        {
            return NotFound();
        }

        return staffAttendance;
    }

    // GET: api/StaffAttendance/Staff/5
    [HttpGet("Staff/{staffId}")]
    public async Task<ActionResult<IEnumerable<StaffAttendance>>> GetStaffAttendanceByStaffId(int staffId)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.StaffAttendances
            .Include(a => a.Staff)
            .Where(a => a.StaffId == staffId && a.KhataBookId == currentKhataBookId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    // GET: api/StaffAttendance/Date/2024-04-11
    [HttpGet("Date/{date}")]
    public async Task<ActionResult<IEnumerable<StaffAttendance>>> GetStaffAttendanceByDate(DateTime date)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.StaffAttendances
            .Include(a => a.Staff)
            .Where(a => a.Date.Date == date.Date && a.KhataBookId == currentKhataBookId)
            .OrderBy(a => a.Staff.Name)
            .ToListAsync();
    }

    // POST: api/StaffAttendance
    [HttpPost]
    public async Task<ActionResult<StaffAttendance>> CreateStaffAttendance(CreateStaffAttendanceDto staffAttendanceDto)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingAttendance = await _context.StaffAttendances
            .FirstOrDefaultAsync(a => a.StaffId == staffAttendanceDto.StaffId && a.Date.Date == staffAttendanceDto.Date.Date && a.KhataBookId == currentKhataBookId);

        if (existingAttendance != null)
        {
            return BadRequest("Attendance for this staff member on this date already exists.");
        }

        var staffAttendance = new StaffAttendance
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            StaffId = staffAttendanceDto.StaffId,
            Date = staffAttendanceDto.Date,
            Status = staffAttendanceDto.Status,
            Note = staffAttendanceDto.Note,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.StaffAttendances.Add(staffAttendance);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStaffAttendance), new { id = staffAttendance.Id }, staffAttendance);
    }

    // PUT: api/StaffAttendance/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStaffAttendance(int id, StaffAttendance staffAttendance)
    {
        if (id != staffAttendance.Id)
        {
            return BadRequest();
        }

        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingAttendance = await _context.StaffAttendances
            .FirstOrDefaultAsync(a => 
                a.StaffId == staffAttendance.StaffId && 
                a.Date.Date == staffAttendance.Date.Date &&
                a.KhataBookId == currentKhataBookId && 
                a.Id != staffAttendance.Id);

        if (existingAttendance != null)
        {
            return BadRequest("Attendance for this staff member on this date already exists.");
        }

        _context.Entry(staffAttendance).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!StaffAttendanceExists(id))
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

    // DELETE: api/StaffAttendance/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaffAttendance(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var staffAttendance = await _context.StaffAttendances
            .FirstOrDefaultAsync(a => a.Id == id && a.KhataBookId == currentKhataBookId);
        if (staffAttendance == null)
        {
            return NotFound();
        }

        _context.StaffAttendances.Remove(staffAttendance);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool StaffAttendanceExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.StaffAttendances.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 