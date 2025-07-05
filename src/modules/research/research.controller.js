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
