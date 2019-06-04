import "reflect-metadata";
import {Connection} from "@/common/connection/connection";
import {AnnotationStore} from "@/data/annotation-store";
import {InstrumentStore} from "@/data/instrument-store";
import {MusicPieceStore} from "@/data/music-piece-store";
import {PartStore} from "@/data/part-store";
import {ExampleStore} from "@/data/example-store";
import {RegisterStore} from "@/data/register-store";
import {UserStore} from "@/data/user-store";
import {TYPES} from "@/inversify-types";
import {AnnotationService} from "@/services/annotation-service";
import {InstrumentService} from "@/services/instrument-service";
import {MusicPieceService} from "@/services/music-piece-service";
import {PartService} from "@/services/part-service";
import {RegisterService} from "@/services/register-service";
import {FileService} from "@/common/service/file-service";
import {RenderingService} from "@/services/rendering-service";
import {UserService} from "@/services/user-service";
import {Container} from "inversify";


const serviceContainer = new Container({defaultScope: "Singleton"});

// alphabetical sorted
serviceContainer.bind<AnnotationService>(TYPES.AnnotationService).to(AnnotationService);
serviceContainer.bind<AnnotationStore>(TYPES.AnnotationStore).to(AnnotationStore);
serviceContainer.bind<Connection>(TYPES.Connection).to(Connection);
serviceContainer.bind<ExampleStore>(TYPES.ExampleStore).to(ExampleStore);
serviceContainer.bind<FileService>(TYPES.FileService).to(FileService);
serviceContainer.bind<InstrumentService>(TYPES.InstrumentService).to(InstrumentService);
serviceContainer.bind<InstrumentStore>(TYPES.InstrumentStore).to(InstrumentStore);
serviceContainer.bind<MusicPieceService>(TYPES.MusicPieceService).to(MusicPieceService);
serviceContainer.bind<MusicPieceStore>(TYPES.MusicPieceStore).to(MusicPieceStore);
serviceContainer.bind<PartService>(TYPES.PartService).to(PartService);
serviceContainer.bind<PartStore>(TYPES.PartStore).to(PartStore);
serviceContainer.bind<RegisterService>(TYPES.RegisterService).to(RegisterService);
serviceContainer.bind<RegisterStore>(TYPES.RegisterStore).to(RegisterStore);
serviceContainer.bind<RenderingService>(TYPES.RenderingService).to(RenderingService);
serviceContainer.bind<UserService>(TYPES.UserService).to(UserService);
serviceContainer.bind<UserStore>(TYPES.UserStore).to(UserStore);

export {serviceContainer};
