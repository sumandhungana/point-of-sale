using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupplierController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SupplierController> _logger;

    public SupplierController(ApplicationDbContext context, ILogger<SupplierController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Supplier
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
    {
        return await _context.Suppliers.ToListAsync();
    }

    // GET: api/Supplier/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Supplier>> GetSupplier(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);

        if (supplier == null)
        {
            return NotFound();
        }

        return supplier;
    }

    // POST: api/Supplier
    [HttpPost]
    public async Task<ActionResult<Supplier>> CreateSupplier(Supplier supplier)
    {
        supplier.CreatedAt = DateTime.UtcNow;
        supplier.UpdatedAt = DateTime.UtcNow;
        
        _context.Suppliers.Add(supplier);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating supplier");
            throw;
        }

        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
    }

    // PUT: api/Supplier/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupplier(int id, Supplier supplier)
    {
        if (id != supplier.Id)
        {
            return BadRequest();
        }

        supplier.UpdatedAt = DateTime.UtcNow;
        _context.Entry(supplier).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SupplierExists(id))
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

    // DELETE: api/Supplier/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
        {
            return NotFound();
        }

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SupplierExists(int id)
    {
        return _context.Suppliers.Any(e => e.Id == id);
    }
} 