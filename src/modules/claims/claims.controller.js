const service = require("./claims.service");

exports.list = async (req, res) => {
  const claims = await service.list(req.query);
  res.json({ success: true, data: claims });
};

exports.getById = async (req, res) => {
  const claim = await service.getById(req.params.id);
  if (!claim)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: claim });
};

exports.create = async (req, res) => {
  const claim = await service.create(req.body);
  res.status(201).json({ success: true, data: claim });
};

exports.update = async (req, res) => {
  const claim = await service.update(req.params.id, req.body);
  if (!claim)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: claim });
};

exports.verifyClaim = async (req, res) => {
  const {
    verificationStatus,
    confidenceScore,
    trustScore,
    scientificReferences,
  } = req.body;
  const claim = await service.verifyClaim(
    req.params.id,
    verificationStatus,
    confidenceScore,
    trustScore,
    scientificReferences
  );
  res.json({ success: true, data: claim });
};
