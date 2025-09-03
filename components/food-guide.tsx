const foodsToEat = [
  "Vegetables (leafy greens, cruciferous)",
  "Whole grains (oats, brown rice, quinoa)",
  "Nuts & seeds (almonds, walnuts, chia)",
  "Lean proteins (fish, chicken, tofu, legumes)",
  "Low GI fruits (berries, apples, pears)",
]

const foodsToAvoid = [
  "Sweets and desserts (cookies, cakes, candy)",
  "Fried foods and fast food",
  "White rice and refined grains",
  "Sugary drinks (soda, energy drinks)",
  "Excess bread and ultra-processed snacks",
]

export default function FoodGuide() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <GuideCard title="Foods to Eat" tone="positive" items={foodsToEat} />
      <GuideCard title="Foods to Avoid" tone="negative" items={foodsToAvoid} />
    </div>
  )
}

function GuideCard({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: "positive" | "negative"
}) {
  const chip =
    tone === "positive"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${chip}`}>
          {tone === "positive" ? "Recommended" : "Limit/Avoid"}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
