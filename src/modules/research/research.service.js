const { ResearchTask, Evidence } = require("./research.model");

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
}

module.exports = new ResearchService();
