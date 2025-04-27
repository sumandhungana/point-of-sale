using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RentalItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RentalItemController> _logger;

    public RentalItemController(ApplicationDbContext context, ILogger<RentalItemController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/RentalItem
    [HttpGet]
    public async Task<ActionResult<RentalItemResponseDto>> GetRentalItems()
    {
        var rentalItems = await _context.RentalItems.OrderByDescending(r => r.CreatedAt).ToListAsync();
        var response = new RentalItemResponseDto
        {
            RentalItem = rentalItems,
            youGive = 234,
            advanceAmount = 435
        };
        return response;
    }

    // GET: api/RentalItem/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RentalItem>> GetRentalItem(int id)
    {
        var rentalItem = await _context.RentalItems.FindAsync(id);

        if (rentalItem == null)
        {
            return NotFound();
        }

        return rentalItem;
    }

    // POST: api/RentalItem
    [HttpPost]
    public async Task<ActionResult<RentalItem>> CreateRentalItem(RentalItem rentalItem)
    {
        rentalItem.CreatedAt = DateTime.UtcNow;
        rentalItem.UpdatedAt = DateTime.UtcNow;
        
        _context.RentalItems.Add(rentalItem);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating rental item");
            throw;
        }

        return CreatedAtAction(nameof(GetRentalItem), new { id = rentalItem.Id }, rentalItem);
    }

    // PUT: api/RentalItem/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRentalItem(int id, RentalItem rentalItem)
    {
        if (id != rentalItem.Id)
        {
            return BadRequest();
        }

        rentalItem.UpdatedAt = DateTime.UtcNow;
        _context.Entry(rentalItem).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!RentalItemExists(id))
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

    // DELETE: api/RentalItem/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRentalItem(int id)
    {
        var rentalItem = await _context.RentalItems.FindAsync(id);
        if (rentalItem == null)
        {
            return NotFound();
        }

        _context.RentalItems.Remove(rentalItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool RentalItemExists(int id)
    {
        return _context.RentalItems.Any(e => e.Id == id);
    }
} 

public class RentalItemResponseDto
{
    public List<RentalItem> RentalItem { get; set; } = new();
    public decimal youGive { get; set; }
    public decimal advanceAmount { get; set; }
}