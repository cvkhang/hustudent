// Sample controller
export const getSampleData = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: { message: 'Sample data from controller' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
