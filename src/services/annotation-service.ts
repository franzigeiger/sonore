import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {AnnotationKind} from "@/common/data-definitions/annotations/kind/annotation-kinds";
import {Place} from "@/common/data-definitions/annotations/place/place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {OrchestraAnnotation} from "@/common/data-definitions/annotations/type/orchestra-annotation";
import {PartAnnotation} from "@/common/data-definitions/annotations/type/part-annotation";
import {PersonalAnnotation} from "@/common/data-definitions/annotations/type/personal-annotation";
import {RegisterAnnotation} from "@/common/data-definitions/annotations/type/register-annotation";
import {MusicPiece} from "@/common/data-definitions/music-piece";
import {Logger} from "@/common/logging";
import {AnnotationStore} from "@/data/annotation-store";
import {SelectionMode} from "@/common/data-definitions/selection-mode";
import {TYPES} from "@/inversify-types";
import {PartService} from "@/services/part-service";
import {RegisterService} from "@/services/register-service";
import {UserService} from "@/services/user-service";
import {inject, injectable} from "inversify";
import store from "@/common/state/store";

@injectable()
export class AnnotationService {
  private registerService: RegisterService;
  private userService: UserService;
  private partServive: PartService;
  
  private annotationStore: AnnotationStore;
  private log = Logger.getNew(AnnotationService.name);
  
  constructor(
    @inject(TYPES.RegisterService) registerService: RegisterService,
    @inject(TYPES.UserService) userService: UserService,
    @inject(TYPES.PartService) partService: PartService,
    @inject(TYPES.AnnotationStore) annotationStore: AnnotationStore,
  ) {
    this.registerService = registerService;
    this.userService = userService;
    this.partServive = partService;
    this.annotationStore = annotationStore;
  }
  
  public isAllowedToPointLive(): boolean {
    return this.isDirigent();
  }
  
  public getValidAnnotationKinds(): AnnotationKind[] {
    const selectionMode: SelectionMode = store.getters.selectionMode;
    return selectionMode.validAnnotationKinds;
  }
  
  public getValidAnnotationTypes(): AnnotationType[] {
    const validAnnotationTypes: AnnotationType[] = [];
    const currentUser = this.userService.getCurrentUser()!;
    // Orchestra-Annotation
    if (this.isDirigent()) {
      validAnnotationTypes.push(new OrchestraAnnotation());
    }
    // Register-Annotations
    const registers = this.registerService.getRegistersForUserAsPrincipal(currentUser);
    registers.forEach((register) => validAnnotationTypes.push(new RegisterAnnotation(register)));
    
    // Part-Annotations - create an empty dummy Annotation
    // allowed for principals and dirigents
    // if (registers.length > 0 || this.isDirigent()) {
    //   validAnnotationTypes.push(new PartAnnotation());
    // }
    // Personal-Annotation
    validAnnotationTypes.push(new PersonalAnnotation());
    return validAnnotationTypes;
  }
  
  public getAllAnnotations(): Array<Annotation<AnnotationType, Place>> {
    return this.annotationStore.getAllAnnotations();
  }
  
  public getAllRevelantAnnotations(musicPiece: MusicPiece): Array<Annotation<AnnotationType, Place>> {
    return this.annotationStore.getAllAnnotations()
      .filter((annotation) => annotation.musicPieceId === musicPiece.id)
      .filter((annotation) => {
        if (annotation.type instanceof OrchestraAnnotation) {
          return true;
        } else if (annotation.type instanceof PartAnnotation) {
          return this.userService.getCurrentUser()!.isDirigent ||
                 (annotation.type as PartAnnotation).parts.map((p) => p.name).includes(
                   this.userService.getCurrentUser()!.parts.get(musicPiece.id)!.name);
        } else if (annotation.type instanceof PersonalAnnotation) {
          return annotation.owner.guid === this.userService.getCurrentUser()!.guid;
        } else if (annotation.type instanceof RegisterAnnotation) {
          return this.userService.getCurrentUser()!.isDirigent ||
                 (annotation.type as RegisterAnnotation).register.principal.guid
                    === this.userService.getCurrentUser()!.guid ||
                 (annotation.type as RegisterAnnotation).register.parts.map((p) => p.name).includes(
                   this.userService.getCurrentUser()!.parts.get(musicPiece.id)!.name);
        }
      });
  }
  
  public addAnnotation(a: Annotation<AnnotationType, Place>) {
    this.annotationStore.addAnnotation(a);
    this.log.info("Anmerkung erstellt: " + JSON.stringify(a));
  }
  
  public registerAnnotationChangedCallback(callback: () => void) {
    this.annotationStore.registerCallback(callback);
  }
  
  public unregisterAnnotationChangedCallback() {
    this.annotationStore.unRegisterCallback();
  }
  
  private isDirigent(): boolean {
    const user = this.userService.getCurrentUser();
    return user !== null && user.isDirigent;
  }
}
