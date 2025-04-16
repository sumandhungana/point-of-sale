using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffSalaryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StaffSalaryController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/StaffSalary
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StaffSalary>>> GetStaffSalaries()
    {
        return await _context.StaffSalaries
            .Include(s => s.Staff)
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ToListAsync();
    }

    // GET: api/StaffSalary/5
    [HttpGet("{id}")]
    public async Task<ActionResult<StaffSalary>> GetStaffSalary(int id)
    {
        var staffSalary = await _context.StaffSalaries
            .Include(s => s.Staff)
            .FirstOrDefaultAsync(s => s.Id == id);

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
        return await _context.StaffSalaries
            .Include(s => s.Staff)
            .Where(s => s.StaffId == staffId)
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ToListAsync();
    }

    // POST: api/StaffSalary
    [HttpPost]
    public async Task<ActionResult<StaffSalary>> CreateStaffSalary(StaffSalary staffSalary)
    {
        staffSalary.SelectedDate = DateTime.SpecifyKind(staffSalary.SelectedDate, DateTimeKind.Utc);
        staffSalary.CalculationDate = DateTime.SpecifyKind(staffSalary.CalculationDate, DateTimeKind.Utc);
        staffSalary.CreatedAt = DateTime.UtcNow;
        staffSalary.UpdatedAt = DateTime.UtcNow;
        _context.StaffSalaries.Add(staffSalary);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStaffSalary), new { id = staffSalary.Id }, staffSalary);
    }

    // PUT: api/StaffSalary/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStaffSalary(int id, StaffSalary staffSalary)
    {
        if (id != staffSalary.Id)
        {
            return BadRequest();
        }

        _context.Entry(staffSalary).State = EntityState.Modified;

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

        return NoContent();
    }

    // DELETE: api/StaffSalary/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaffSalary(int id)
    {
        var staffSalary = await _context.StaffSalaries.FindAsync(id);
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
        return _context.StaffSalaries.Any(e => e.Id == id);
    }
} 