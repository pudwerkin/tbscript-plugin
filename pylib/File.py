''' This is wrapper for a file object, containing a filename and data (Used to pass between modules).'''
class File:
    filename = ""
    data = ""
 
    def __init__(self, filename, data):
        self.filename = filename
        self.data = data