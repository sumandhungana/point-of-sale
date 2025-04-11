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
    public async Task<ActionResult<IEnumerable<Staff>>> GetStaff()
    {
        return await _context.Staff
            .Include(s => s.StaffSalaries)
            .Include(s => s.StaffAttendances)
            .ToListAsync();
    }

    // GET: api/Staff/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Staff>> GetStaff(int id)
    {
        var staff = await _context.Staff
            .Include(s => s.StaffSalaries)
            .Include(s => s.StaffAttendances)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (staff == null)
        {
            return NotFound();
        }

        return staff;
    }

    // POST: api/Staff
    [HttpPost]
    public async Task<ActionResult<Staff>> CreateStaff(Staff staff)
    {
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
    public async Task<ActionResult<IEnumerable<StaffAttendance>>> GetStaffAttendance(int id)
    {
        return await _context.StaffAttendances
            .Where(a => a.StaffId == id)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
    }

    // GET: api/Staff/5/Salary
    [HttpGet("{id}/Salary")]
    public async Task<ActionResult<IEnumerable<StaffSalary>>> GetStaffSalary(int id)
    {
        return await _context.StaffSalaries
            .Where(s => s.StaffId == id)
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.Month)
            .ToListAsync();
    }

    private bool StaffExists(int id)
    {
        return _context.Staff.Any(e => e.Id == id);
    }
} 