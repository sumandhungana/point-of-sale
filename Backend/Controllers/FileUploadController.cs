using Microsoft.AspNetCore.Mvc;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileUploadController : ControllerBase
{
    private readonly ILogger<FileUploadController> _logger;

    public FileUploadController(ILogger<FileUploadController> logger)
    {
        _logger = logger;
    }

    // POST: api/FileUpload
    [HttpPost]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        try
        {
            var filePath = await FileUploadHelper.UploadFileAsync(file, _logger);
            return Ok(new { filePath });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            return StatusCode(500, "Error uploading file");
        }
    }

    // GET: api/FileUpload
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("File upload service is running");
    }
} 