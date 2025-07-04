import { denormaliseShape } from '../utils/shape';
import { denormaliseText } from '../utils/text';
import { type TemplateElement } from '../types';
import { useFabric } from '../FabricProvider';
import { useObjects } from './useObjects';
import { serialize } from '../utils/serialise';

export const useImportExport = () => {
  const canvas = useFabric();
  const { addShape, addText } = useObjects();

  const loadTemplate = (elems: TemplateElement[]) => {
    canvas?.clear();
    elems.forEach((e) => {
      if (e.type === 'text') addText(e.content, denormaliseText(e));
      else if (e.type === 'shape') addShape(e.style!.shapeType!, denormaliseShape(e));
    });
  };

  const exportTemplate = (): TemplateElement[] | undefined => {
    return canvas?.getObjects().map((o) => serialize(o));
  };

  return { loadTemplate, exportTemplate };
};
