const PageSkeleton = () => {
    return (
        <Section>
        <div className= "pt-10 flex items-center justify-between pb-10" >
        <div>
        <Heading
              as={ 1 }
    styleLevel = { 3}
        >
        My Templates
            </Heading>
            </div>
            < CreateButton
    config = { selectionConfig }
    onCreate = { handleCreate }
        />
        </div>
        < InteractiveGrid
    items = { gridItems }
    collectionSlug = "templates"
    onDeleteItems = { handleDeleteItems }
    onUpdateItem = { handleUpdateItem }
    isLoading = { isFetchingNextPage }
    isInitialLoading = { isLoading }
    hasMore = { hasNextPage }
    onFetchNextPage = { handleFetchNextPage }
        />
        </Section>
    )
}