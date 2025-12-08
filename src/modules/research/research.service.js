const { ResearchTask, Evidence, ResearchReport } = require("./research.model");
const { generateHealthTopicReport } = require("../../utils/openai");

class ResearchService {
  async listTasks() {
    return ResearchTask.find().populate("claim assignedTo");
  }
  async createTask(data) {
    return ResearchTask.create(data);
  }
  async updateTask(id, data) {
    return ResearchTask.findByIdAndUpdate(id, data, { new: true });
  }
  async submitEvidence(data) {
    return Evidence.create(data);
  }
  async listEvidence(claimId) {
    return Evidence.find({ claim: claimId });
  }

  /**
   * Generate a comprehensive research report for a health topic using AI
   */
  async generateTopicReport(data) {
    const {
      topic,
      timeRange,
      includeRevenue,
      verifyJournals,
      selectedJournals,
      productsPerInfluencer,
      userId,
    } = data;

    // Create initial report with pending status
    const report = await ResearchReport.create({
      topic,
      createdBy: userId,
      status: "pending",
      timeRange,
      includeRevenue,
      verifyJournals,
      selectedJournals: selectedJournals || [],
      productsPerInfluencer: productsPerInfluencer || 0,
    });

    // Generate report using OpenAI (async)
    try {
      const aiResult = await generateHealthTopicReport(topic, selectedJournals || []);

      if (aiResult.success && aiResult.report) {
        // Update report with AI-generated content
        report.scientificConsensus = aiResult.report.scientificConsensus;
        report.commonClaims = aiResult.report.commonClaims || [];
        report.riskFactors = aiResult.report.riskFactors || [];
        report.considerations = aiResult.report.considerations || [];
        report.relevantJournals = aiResult.report.relevantJournals || [];
        report.suggestedInfluencers = aiResult.report.suggestedInfluencers || [];
        report.summary = aiResult.report.summary;
        report.keyTakeaways = aiResult.report.keyTakeaways || [];
        report.status = "completed";
      } else {
        report.status = "failed";
        report.summary = `Failed to generate report: ${aiResult.error}`;
      }

      await report.save();
    } catch (error) {
      report.status = "failed";
      report.summary = `Error: ${error.message}`;
      await report.save();
    }

    return report;
  }

  /**
   * List all research reports
   */
  async listReports(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.createdBy = filters.userId;
    
    return ResearchReport.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50);
  }

  /**
   * Get a single report by ID
   */
  async getReport(reportId) {
    return ResearchReport.findById(reportId).populate("createdBy", "name email");
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId) {
    return ResearchReport.findByIdAndDelete(reportId);
  }
}

module.exports = new ResearchService();
