const service = require("./research.service");

exports.listTasks = async (req, res) => {
  const data = await service.listTasks();
  res.json({ success: true, data });
};

exports.createTask = async (req, res) => {
  const data = await service.createTask(req.body);
  res.status(201).json({ success: true, data });
};

exports.updateTask = async (req, res) => {
  const data = await service.updateTask(req.params.id, req.body);
  res.json({ success: true, data });
};

exports.submitEvidence = async (req, res) => {
  const data = await service.submitEvidence(req.body);
  res.status(201).json({ success: true, data });
};

exports.listEvidence = async (req, res) => {
  const data = await service.listEvidence(req.params.claimId);
  res.json({ success: true, data });
};

// Research Report endpoints
exports.generateReport = async (req, res) => {
  try {
    const userId = req.user?._id; // Get from auth middleware if available
    const data = await service.generateTopicReport({ ...req.body, userId });
    res.status(201).json({ 
      success: true, 
      data,
      message: "Research report generation started. This may take a few moments." 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.listReports = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      userId: req.query.userId,
      limit: parseInt(req.query.limit) || 50,
    };
    const data = await service.listReports(filters);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.getReport = async (req, res) => {
  try {
    const data = await service.getReport(req.params.id);
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        error: "Report not found" 
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const data = await service.deleteReport(req.params.id);
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        error: "Report not found" 
      });
    }
    res.json({ 
      success: true, 
      message: "Report deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
