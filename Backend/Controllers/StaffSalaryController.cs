using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffSalaryController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IKhataBookContext _khataBookContext;

    public StaffSalaryController(ApplicationDbContext context, IKhataBookContext khataBookContext)
    {
        _context = context;
        _khataBookContext = khataBookContext;
    }

    // GET: api/StaffSalary
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StaffSalary>>> GetStaffSalaries()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.StaffSalaries
            .Include(s => s.Staff)
            .Where(s => s.KhataBookId == currentKhataBookId)
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ToListAsync();
    }

    // GET: api/StaffSalary/5
    [HttpGet("{id}")]
    public async Task<ActionResult<StaffSalary>> GetStaffSalary(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var staffSalary = await _context.StaffSalaries
            .Include(s => s.Staff)
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);

        if (staffSalary == null)
        {
            return NotFound();
        }

        return staffSalary;
    }

    // GET: api/StaffSalary/Staff/5
    [HttpGet("Staff/{staffId}")]
    public async Task<ActionResult<IEnumerable<StaffSalary>>> GetStaffSalariesByStaffId(int staffId)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.StaffSalaries
            .Include(s => s.Staff)
            .Where(s => s.StaffId == staffId && s.KhataBookId == currentKhataBookId)
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ToListAsync();
    }

    // POST: api/StaffSalary
    [HttpPost]
    public async Task<ActionResult<StaffSalary>> CreateStaffSalary(CreateStaffSalaryDto staffSalaryDto)
    {
        var staffSalary = new StaffSalary
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            StaffId = staffSalaryDto.StaffId,
            Month = staffSalaryDto.Month,
            Year = staffSalaryDto.Year,
            SelectedDate = DateTime.SpecifyKind(staffSalaryDto.SelectedDate, DateTimeKind.Utc),
            IsSlideOn = staffSalaryDto.IsSlideOn,
            CalculationDate = DateTime.SpecifyKind(staffSalaryDto.CalculationDate, DateTimeKind.Utc),
            SalaryType = staffSalaryDto.SalaryType,
            Amount = staffSalaryDto.Amount,
            Permission = staffSalaryDto.Permission,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.StaffSalaries.Add(staffSalary);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStaffSalary), new { id = staffSalary.Id }, staffSalary);
    }

    // PUT: api/StaffSalary/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStaffSalary(int id, UpdateStaffSalaryDto updateDto)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingSalary = await _context.StaffSalaries
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);
        
        if (existingSalary == null)
        {
            return NotFound();
        }

        // Update only the provided properties
        if (updateDto.StaffId.HasValue)
            existingSalary.StaffId = updateDto.StaffId.Value;
        if (updateDto.Year.HasValue)
            existingSalary.Year = updateDto.Year.Value;
        if (updateDto.Month.HasValue)
            existingSalary.Month = updateDto.Month.Value;
        if (updateDto.SelectedDate.HasValue)
            existingSalary.SelectedDate = updateDto.SelectedDate.Value;
        if (updateDto.IsSlideOn.HasValue)
            existingSalary.IsSlideOn = updateDto.IsSlideOn.Value;
        if (updateDto.CalculationDate.HasValue)
            existingSalary.CalculationDate = updateDto.CalculationDate.Value;
        if (!string.IsNullOrEmpty(updateDto.SalaryType))
            existingSalary.SalaryType = updateDto.SalaryType;
        if (updateDto.Amount.HasValue)
            existingSalary.Amount = updateDto.Amount.Value;
        if (!string.IsNullOrEmpty(updateDto.Permission))
            existingSalary.Permission = updateDto.Permission;
        
        existingSalary.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!StaffSalaryExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return Ok(new { message = "Staff salary updated successfully" });
    }

    // DELETE: api/StaffSalary/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaffSalary(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var staffSalary = await _context.StaffSalaries
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);
        if (staffSalary == null)
        {
            return NotFound();
        }

        _context.StaffSalaries.Remove(staffSalary);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool StaffSalaryExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.StaffSalaries.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 