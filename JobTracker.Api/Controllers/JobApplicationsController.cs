using JobTracker.Api.Data;
using JobTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JobTracker.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JobApplicationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        return int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplication>>> GetAll()
    {
        var userId = GetUserId();

        return await _context.JobApplications
            .Where(j => j.UserId == userId)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplication>> GetById(int id)
    {
        var userId = GetUserId();

        var jobApplication = await _context.JobApplications
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (jobApplication == null)
            return NotFound();

        return jobApplication;
    }

    [HttpPost]
    public async Task<ActionResult<JobApplication>> Create(JobApplication jobApplication)
    {
        var userId = GetUserId();

        jobApplication.UserId = userId;

        _context.JobApplications.Add(jobApplication);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = jobApplication.Id }, jobApplication);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, JobApplication updatedJobApplication)
    {
        var userId = GetUserId();

        if (id != updatedJobApplication.Id)
            return BadRequest();

        var existingJobApplication = await _context.JobApplications
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (existingJobApplication == null)
            return NotFound();

        existingJobApplication.CompanyName = updatedJobApplication.CompanyName;
        existingJobApplication.Position = updatedJobApplication.Position;
        existingJobApplication.Status = updatedJobApplication.Status;
        existingJobApplication.DateApplied = updatedJobApplication.DateApplied;
        existingJobApplication.Notes = updatedJobApplication.Notes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        var jobApplication = await _context.JobApplications
            .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

        if (jobApplication == null)
            return NotFound();

        _context.JobApplications.Remove(jobApplication);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}