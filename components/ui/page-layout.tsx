import {
  Page as PrimitivePage,
  PageActions as PrimitivePageActions,
  PageContent as PrimitivePageContent,
  PageDescription as PrimitivePageDescription,
  PageHeader as PrimitivePageHeader,
  PageTitle as PrimitivePageTitle,
} from '@summoniq/applab-ui';
import type { ComponentProps, PropsWithChildren, ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

const PagePrimitive = PrimitivePage as unknown as (
  props: PropsWithChildren<ComponentProps<'div'>>,
) => ReactElement;

const PageHeaderPrimitive = PrimitivePageHeader as unknown as (
  props: PropsWithChildren<ComponentProps<'div'>>,
) => ReactElement;

const PageTitlePrimitive = PrimitivePageTitle as unknown as (
  props: PropsWithChildren<ComponentProps<'h1'>>,
) => ReactElement;

const PageDescriptionPrimitive = PrimitivePageDescription as unknown as (
  props: PropsWithChildren<ComponentProps<'p'>>,
) => ReactElement;

const PageActionsPrimitive = PrimitivePageActions as unknown as (
  props: PropsWithChildren<ComponentProps<'div'>>,
) => ReactElement;

const PageContentPrimitive = PrimitivePageContent as unknown as (
  props: PropsWithChildren<ComponentProps<'div'>>,
) => ReactElement;

type PageHeaderProps = PropsWithChildren<ComponentProps<'div'>> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

const Page = ({ className, ...props }: ComponentProps<'div'>) => (
  <PagePrimitive
    className={cn('flex min-h-0 flex-1 flex-col', className)}
    {...props}
  />
);

const PageHeader = ({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: PageHeaderProps) => {
  if (children) {
    return (
      <PageHeaderPrimitive className={className} {...props}>
        {children}
      </PageHeaderPrimitive>
    );
  }

  return (
    <PageHeaderPrimitive className={className} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {title != null ? <PageTitle>{title}</PageTitle> : null}
          {description != null ? (
            <PageDescription>{description}</PageDescription>
          ) : null}
        </div>
        {actions != null ? <PageActions>{actions}</PageActions> : null}
      </div>
    </PageHeaderPrimitive>
  );
};

const PageTitle = ({ className, ...props }: ComponentProps<'h1'>) => (
  <PageTitlePrimitive className={className} {...props} />
);

const PageDescription = ({ className, ...props }: ComponentProps<'p'>) => (
  <PageDescriptionPrimitive className={className} {...props} />
);

const PageActions = ({ className, ...props }: ComponentProps<'div'>) => (
  <PageActionsPrimitive className={className} {...props} />
);

const PageBody = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('flex min-h-0 flex-1 flex-col p-4', className)}
    {...props}
  />
);

const PageContent = ({ className, ...props }: ComponentProps<'div'>) => (
  <PageContentPrimitive className={className} {...props} />
);

export {
  Page,
  PageActions,
  PageBody,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
};
