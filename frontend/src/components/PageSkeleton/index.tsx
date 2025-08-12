import type { CreateActionProps } from "../CreateAction"
import { CreateAction } from "../CreateAction"
import Heading from "../Heading/Heading"
import { Section } from "../ui/section"

interface PageSkeletonProps {
    heading?: string;
    children: React.ReactNode;
    createActionProps?: CreateActionProps;
}

const PageSkeleton = ({ heading = "Page", children, createActionProps }: PageSkeletonProps) => {
    return (
        <Section>
            <div className="pt-10 flex items-center justify-between pb-10" >
                <div>
                    <Heading
                        as={1}
                        styleLevel={3}
                    >
                        {heading}
                    </Heading>
                </div>
                {createActionProps && <CreateAction
                    {...createActionProps}
                />}
            </div>
            {children}
        </Section>
    )
}

export default PageSkeleton;