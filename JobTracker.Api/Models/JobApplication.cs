namespace JobTracker.Api.Models;

public class JobApplication
{
    public int Id {get; set;}
    public int UserId { get; set; }
    public string CompanyName {get; set;} = string.Empty;
    public string Position {get; set;} = string.Empty;
    public string Status {get; set;} = "Applied";
    public DateTime DateApplied {get; set;} = DateTime.Now;
    public string? Notes {get; set;}
}