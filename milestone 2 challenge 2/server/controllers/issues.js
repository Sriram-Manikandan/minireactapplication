let issues = [];

exports.getIssues = (req, res) => {
  res.json(issues);
};

exports.createIssue = (req, res) => {
  const { title, description } = req.body;
  const issue = { id: Date.now(), title, description, status: 'open', createdAt: new Date() };
  issues.unshift(issue);
  res.status(201).json(issue);
};

exports.updateIssue = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  issues = issues.map(i => i.id === parseInt(id) ? { ...i, status } : i);
  const updated = issues.find(i => i.id === parseInt(id));
  res.json(updated);
};