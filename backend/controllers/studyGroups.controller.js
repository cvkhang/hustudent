// Study Groups Controller Stub
export const getStudyGroups = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: 'Study groups stub' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};