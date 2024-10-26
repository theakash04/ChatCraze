class Apiresponse:
  def __init__(self, statusCode,data=None, message = "success" ):
    self.statusCode = statusCode
    self.data = data
    self.message = message
    self.success = statusCode < 400


__all__ = ["Apiresponse"]