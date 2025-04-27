using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ServiceController> _logger;

    public ServiceController(ApplicationDbContext context, ILogger<ServiceController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Service
    [HttpGet]
    public async Task<ActionResult<ServiceResponseDto>> GetServices()
    {
        var services = await _context.Services.OrderByDescending(s => s.CreatedAt).ToListAsync();
        var response = new ServiceResponseDto
        {
            Service = services,
            // NetMonthlySales = services.Sum(s => s.NetMonthlySales),
            // GrossMonthlySales = services.Sum(s => s.GrossMonthlySales),
            NetMonthlySales = 2334,
            GrossMonthlySales = 435,
            TotalItems = services.Count
        };
        return response;
    }

    // GET: api/Service/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Service>> GetService(int id)
    {
        var service = await _context.Services.FindAsync(id);

        if (service == null)
        {
            return NotFound();
        }

        return service;
    }

    // POST: api/Service
    [HttpPost]
    public async Task<ActionResult<Service>> CreateService([FromForm] ServiceCreateDto serviceDto)
    {
        try
        {
            string ImagePath = null;
            if (serviceDto.Image != null)
            {
                ImagePath = await FileUploadHelper.UploadFileAsync(serviceDto.Image, _logger);
            }

            var service = new Service
            {
                ServiceName = serviceDto.ServiceName,
                Price = serviceDto.Price,
                TaxIncluded = serviceDto.TaxIncluded,
                Tax = serviceDto.Tax,
                Vat = serviceDto.Vat,
                ImagePath = ImagePath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            if (service.TaxIncluded)
            {
                service.TaxIncludedAmount = service.Price + (service.Price * (service.Tax ?? 0) / 100);
            }

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating service");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Service/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromForm] ServiceUpdateDto serviceDto)
    {
        try
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            service.ServiceName = serviceDto.ServiceName;
            service.Price = serviceDto.Price;
            service.TaxIncluded = serviceDto.TaxIncluded;
            service.Tax = serviceDto.Tax;
            service.Vat = serviceDto.Vat;
            service.UpdatedAt = DateTime.UtcNow;

            if (serviceDto.Image != null)
            {
                // Delete old image if exists
                if (!string.IsNullOrEmpty(service.ImagePath))
                {
                    FileUploadHelper.DeleteFile(service.ImagePath);
                }
                // Upload new image
                service.ImagePath = await FileUploadHelper.UploadFileAsync(serviceDto.Image, _logger);
            }

            if (service.TaxIncluded)
            {
                service.TaxIncludedAmount = service.Price + (service.Price * (service.Tax ?? 0) / 100);
            }

            _context.Entry(service).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating service");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Service/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
        {
            return NotFound();
        }

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ServiceExists(int id)
    {
        return _context.Services.Any(e => e.Id == id);
    }
} 

public class ServiceResponseDto
{
    public List<Service> Service { get; set; } = new();
    public decimal NetMonthlySales { get; set; }
    public decimal GrossMonthlySales { get; set; }
    public int TotalItems { get; set; }
}

public class ServiceCreateDto
{
    public string ServiceName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool TaxIncluded { get; set; }
    public decimal? Tax { get; set; }
    public decimal? Vat { get; set; }
    public IFormFile? Image { get; set; }
}

public class ServiceUpdateDto
{
    public string ServiceName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool TaxIncluded { get; set; }
    public decimal? Tax { get; set; }
    public decimal? Vat { get; set; }
    public IFormFile? Image { get; set; }
}