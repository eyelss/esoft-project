type Product = {
  title: string;
  amount: string;
}

type Prologue = {
  title: string;
  description?: string;
};

type Epilogue = {
  title: string;
  description?: string;
};

type Story = {
  duration: number,
  title: string;
  description?: string;
};

type StepExt = {
  body: Story,
  epil: Epilogue,
}

type Step = {
  prol: Prologue,
  long?: StepExt,
  usageProducts: Product[],
  next: Step[],
};

type Recipe = {
  title: string;
  description: string;
  rootSteps: Step[],
};

const Salad: Recipe = {
  title: 'Картошка в духовке',
  description: 'Очень питательная картошка',
  rootSteps: [
    {
      prol: {
        title: 'Нарежьте картофель и полейте маслом'
      },
      long: {
        body: {
          title: 'Поставьте в духовку',
          duration: 50, // допустим минут
        },
        epil: {
          title: 'Достаньте из духовке и кушайте'
        }
      },
      usageProducts: [],
      next: [],
    }
  ]
}