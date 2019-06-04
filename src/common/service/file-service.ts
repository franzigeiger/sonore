import {Logger} from "../logging";
import {injectable} from "inversify";


@injectable()
export class FileService {
  private log = Logger.getNew(FileService.name);
  private fsTemporary?: FileSystem;
  private fsPersistent?: FileSystem;
  private readonly size = 100 * 1024 * 1024; // 100MB
  
  constructor() {
    if (window.cordova !== undefined) {
      this.getFilesystem(this.size, window.TEMPORARY, (fs: FileSystem) => {
        this.fsTemporary = fs;
      });
    } else {
      this.log.info("Caching and data disabled - this is not a cordova device");
    }
  }
  
  public useFilesystem(isTemporary: boolean, functionToCall: (fs: FileSystem) => void) {
    const currentFs = isTemporary ? this.fsTemporary : this.fsPersistent;
    if (!currentFs) {
      if (isTemporary) {
        this.getFilesystem(this.size, window.TEMPORARY, (fs: FileSystem) => {
          this.fsTemporary = fs;
          functionToCall(fs);
        });
      } else {
        this.getFilesystem(this.size, window.PERSISTENT, (fs: FileSystem) => {
          this.fsPersistent = fs;
          functionToCall(fs);
        });
      }
    } else {
      functionToCall(currentFs);
    }
  }
  
  public getFilesystem(size: number, typeTemporaryOrPeristent: number, fsCallback: (fs: FileSystem) => void) {
    window.requestFileSystem(typeTemporaryOrPeristent, size, (fs: FileSystem) => {
      fsCallback(fs);
    }, (fileError: FileError) => {
      this.log.error("Failed to get Filesystem!", fileError);
    });
  }
  
  public createFile(filename: string, isTemporary: boolean, fileEntryCallback: (fileEntry: FileEntry) => void) {
    this.useFilesystem(isTemporary, (fileSystem: FileSystem) => {
      fileSystem.root.getFile(filename, {create: true, exclusive: false}, (fileEntry: FileEntry) => {
        fileEntryCallback(fileEntry);
      }, (fileError: FileError) => {
        this.log.warn("Failed to create File!", fileError, filename);
      });
    });
  }
  
  public existsFile(filename: string, isTemporary: boolean,
                    existsCallback: (fileEntry: FileEntry) => void, notExistsCallback: () => void) {
    this.useFilesystem(isTemporary, (fileSystem: FileSystem) => {
      fileSystem.root.getFile(filename, {create: false}, (fileEntry: FileEntry) => {
        existsCallback(fileEntry);
      }, () => {
        notExistsCallback();
      });
    });
  }
  
  public readFile(fileEntry: FileEntry, output: (data: string) => void) {
    fileEntry.file((file: File) => {
      const reader: FileReader = new FileReader();
      reader.onloadend = function () {
        output(this.result as string);
      };
      reader.readAsText(file);
    }, (fileError: FileError) => {
      this.log.error("Failed to read file", fileError);
    });
  }
  
  public writeFile(fileEntry: FileEntry, data: string, mimeType: string) {
    fileEntry.createWriter((fileWriter: FileWriter) => {
      const dataObj: Blob = new Blob([data], {type: mimeType});
      fileWriter.write(dataObj);
    }, (fileError: FileError) => {
      this.log.warn("Failed to write file", fileError);
    });
  }
}
