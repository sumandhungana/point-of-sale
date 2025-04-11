using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ItemController> _logger;

    public ItemController(ApplicationDbContext context, ILogger<ItemController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Item
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems()
    {
        return await _context.Items
            .Include(i => i.Category)
            .ToListAsync();
    }

    // GET: api/Item/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return item;
    }

    // POST: api/Item
    [HttpPost]
    public async Task<ActionResult<Item>> CreateItem(Item item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        
        _context.Items.Add(item);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating item");
            throw;
        }

        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
    }

    // PUT: api/Item/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, Item item)
    {
        if (id != item.Id)
        {
            return BadRequest();
        }

        item.UpdatedAt = DateTime.UtcNow;
        _context.Entry(item).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ItemExists(id))
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

    // DELETE: api/Item/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ItemExists(int id)
    {
        return _context.Items.Any(e => e.Id == id);
    }
} 