import {Annotation} from "@/common/data-definitions/annotations/annotation";
import {Place} from "@/common/data-definitions/annotations/place/place";
import {AnnotationType} from "@/common/data-definitions/annotations/type/annotation-type";
import {AnnotationScreens} from "@/presentation/components/annotations/annotation-screens";
import {Module, Mutation, VuexModule} from "vuex-module-decorators";

@Module
export default class AnnotationCreation extends VuexModule {
  private mAnnotation: Annotation<AnnotationType, Place> | undefined = undefined;
  private mScreenStack: AnnotationScreens[] = [];
  
  
  public get annotation(): Annotation<AnnotationType, Place> | undefined {
    return this.mAnnotation;
  }
  
  public get annotationScreenStack(): AnnotationScreens[] {
    return this.mScreenStack;
  }
  
  @Mutation
  public setAnnotation(annotation: Annotation<AnnotationType, Place> | undefined): void {
    this.mAnnotation = annotation;
  }
  
  @Mutation
  public annotationScreenAdd(screen: AnnotationScreens): void {
    // remove all Click-Selection-Screens, because it's difficult to get this state back
    this.mScreenStack = this.mScreenStack.filter((s: AnnotationScreens) => {
      return s !== AnnotationScreens.clickSelection;
    });
    this.mScreenStack.push(screen);
  }
  
  @Mutation
  public annotationScreenGoBack(): void {
    this.mScreenStack.pop();
  }
  
  @Mutation
  public annotationReset(): void {
    this.mScreenStack = [];
    this.mAnnotation = undefined;
  }
}
